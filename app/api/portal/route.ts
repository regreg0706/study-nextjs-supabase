import { NextResponse } from 'next/server';
import initStripe from 'stripe';
import { supabaseRouteHandlerClient } from '@/utils/supabaseRouteHandlerClient';

export async function GET() {
    const supabase = supabaseRouteHandlerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    }

    const { data: stripe_cutomer_data } = await supabase
    .from('profile')
    .select('stripe_customer')
    .eq('id', user?.id)
    .single();

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.billingPortal.sessions.create({
        customer: stripe_cutomer_data?.stripe_customer!,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    });


    return NextResponse.json({
        url: session.url,
    });

}