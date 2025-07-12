import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'delivery_update' | 'payment_success' | 'general';
  data?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, title, message, type, data = {} }: NotificationData = await req.json();

    if (!user_id || !title || !message || !type) {
      throw new Error("Missing required fields: user_id, title, message, type");
    }

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Insert notification into database
    const { data: notification, error: insertError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        data,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Send real-time notification via Supabase channel
    const channel = supabaseClient.channel(`notifications_${user_id}`);
    
    channel.send({
      type: 'broadcast',
      event: 'new_notification',
      payload: notification
    });

    console.log(`Notification sent to user ${user_id}: ${title}`);

    return new Response(
      JSON.stringify({
        success: true,
        notification
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});