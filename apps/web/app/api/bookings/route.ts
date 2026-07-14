export const dynamic = 'force-dynamic';

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { readSessionToken } from "../../lib/server/auth";
import { SESSION_COOKIE } from "../../lib/server/constants";
import { prisma } from "../../lib/server/prisma";
import { bookingSchema, zodFieldErrors } from "../../lib/validation";
import { getStripeClient } from "../../lib/server/stripe";

function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return readSessionToken(token);
}

function maskValue(raw: string, start = 2, end = 2) {
  const trimmed = raw.trim();
  if (trimmed.length <= start + end) return "*".repeat(Math.max(2, trimmed.length));
  const left = trimmed.slice(0, start);
  const right = trimmed.slice(-end);
  return `${left}${"*".repeat(Math.max(4, trimmed.length - (start + end)))}${right}`;
}

function mapBookingRow(booking: {
  bookingRef: string;
  userId: string;
  fromCity: string;
  toCity: string;
  travelDate: Date;
  travelType: string;
  platformName: string;
  finalPrice: number;
  passengers: number;
  travellerName: string;
  maskedTravellerId: string;
  paymentMethod: string;
  paymentProvider: string;
  paymentIntentId: string;
  maskedPaymentValue: string;
  createdAt: Date;
}) {
  return {
    booking_ref: booking.bookingRef,
    user_id: booking.userId,
    from_city: booking.fromCity,
    to_city: booking.toCity,
    travel_date: booking.travelDate.toISOString().slice(0, 10),
    travel_type: booking.travelType,
    platform_name: booking.platformName,
    final_price: booking.finalPrice,
    passengers: booking.passengers,
    traveller_name: booking.travellerName,
    masked_traveller_id: booking.maskedTravellerId,
    payment_method: booking.paymentMethod,
    payment_provider: booking.paymentProvider,
    payment_intent_id: booking.paymentIntentId,
    masked_payment_value: booking.maskedPaymentValue,
    created_at: booking.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    return NextResponse.json({ message: "Please verify your email before booking." }, { status: 403 });
  }

  const rows = await prisma.booking.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
  });

  const items = rows.map(mapBookingRow);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { emailVerified: true },
  });
  if (!user?.emailVerified) {
    return NextResponse.json({ message: "Please verify your email before booking." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please fix the highlighted fields.", fieldErrors: zodFieldErrors(parsed) },
        { status: 400 },
      );
    }

    const bookingReq = parsed.data;

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { message: "Payment service is not configured. Add STRIPE_SECRET_KEY." },
        { status: 503 },
      );
    }

    const amount = bookingReq.final_price * 100;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      payment_method: bookingReq.payment_token,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      description: `Tripzy booking ${bookingReq.from_city} to ${bookingReq.to_city}`,
    });

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ message: "Payment not completed." }, { status: 402 });
    }

    const paymentMethod = paymentIntent.payment_method;
    const paymentMethodId = typeof paymentMethod === "string" ? paymentMethod : paymentMethod?.id;
    let maskedPayment = "Tokenized payment";
    if (paymentMethodId) {
      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      if ("card" in pm && pm.card?.last4) {
        maskedPayment = `**** **** **** ${pm.card.last4}`;
      }
    }

    const bookingRow = await prisma.booking.create({
      data: {
        bookingRef: `TZ${Date.now().toString().slice(-7)}${Math.floor(Math.random() * 90 + 10)}`,
        userId: session.uid,
        fromCity: bookingReq.from_city,
        toCity: bookingReq.to_city,
        travelDate: new Date(bookingReq.travel_date),
        travelType: bookingReq.travel_type,
        platformName: bookingReq.platform_name,
        finalPrice: bookingReq.final_price,
        passengers: bookingReq.passengers,
        travellerName: bookingReq.traveller_name,
        maskedTravellerId: maskValue(bookingReq.traveller_id.replace(/\s+/g, ""), 2, 2),
        paymentMethod: bookingReq.payment_method,
        paymentProvider: "stripe",
        paymentIntentId: paymentIntent.id,
        maskedPaymentValue: maskedPayment,
      },
    });

    return NextResponse.json({ booking: mapBookingRow(bookingRow) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }
}
