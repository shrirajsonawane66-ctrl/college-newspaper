import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[Contact API] POST received body:", JSON.stringify(body));

    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      console.error("[Contact API] Missing required fields:", { name, email, subject, message });
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    console.log("[Contact API] Supabase client created, inserting...");

    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name,
          email,
          subject,
          message,
        },
      ]);

    if (error) {
      console.error("[Contact API] Supabase insert error:", JSON.stringify(error));
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("[Contact API] Insert success:", JSON.stringify(data));
    return Response.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Contact API] Unhandled error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && ["unread", "read", "archived"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data: messages, error: fetchError } = await query;

    if (fetchError) {
      console.error("[Contact API] Fetch error:", JSON.stringify(fetchError));
      return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    const { count: unreadCount } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");

    console.log("[Contact API] Fetched messages:", messages?.length || 0, "unread:", unreadCount || 0);
    return Response.json({ messages, unreadCount }, { status: 200 });
  } catch (err) {
    console.error("[Contact API] GET error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
