import { init } from "next/dist/compiled/webpack/webpack";
import { NextRequest, NextResponse } from "next/server";
import initStripe from "stripe";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/lib/database.types";

export async function POST(req: NextRequest) {
    const supabase = createRouteHandlerClient<Database>({cookies});
    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);
    const endpointSecret = process.env.STRIPE_SIGNING_SECRET;
    const signature = req.headers.get("stripe-signature");

    const reqBuffer = Buffer.from(await req.arrayBuffer());

    let event;

    try {
      event = stripe.webhooks.constructEvent(reqBuffer, signature!, endpointSecret!);

      switch (event.type) {
        case 'customer.subscription.created':
            const customerSubscriptionCreated = event.data.object;
            await supabase
            .from('profile')
            .update({
                is_subscribed: true,
                interval: customerSubscriptionCreated.items.data[0].plan.interval,
            })
            .eq('stripe_customer', event.data.object.customer);

            break;
        case 'customer.subscription.updated':
            const customerSubscriptionUpdated = event.data.object;
            if (customerSubscriptionUpdated.status === 'canceled') {
                await supabase
                .from('profile')
                .update({
                    is_subscribed: false,
                    interval: null,
                })
                .eq('stripe_customer', event.data.object.customer);
            } else {
                await supabase
                .from('profile')
                .update({
                    is_subscribed: true,
                    interval: customerSubscriptionUpdated.items.data[0].plan.interval,
                })
                .eq('stripe_customer', event.data.object.customer);
            }

            break;
        case 'customer.subscription.deleted':
            await supabase
            .from('profile')
            .update({
                is_subscribed: false,
                interval: null,
            })
            .eq('stripe_customer', event.data.object.customer);

            break;
        
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return NextResponse.json({received: true});
    } catch (err: any) {
      
      return NextResponse.json(`Webhook Error: ${err.message}`, {status: 401});
    }


}
