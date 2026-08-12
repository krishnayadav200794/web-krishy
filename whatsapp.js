/**
 * Phase 1/2 WhatsApp integration: click-to-chat (wa.me) deep links.
 *
 * We deliberately do NOT auto-send WhatsApp messages here. Sending
 * automated WhatsApp messages requires an approved Meta Cloud API or
 * Twilio WhatsApp account (business verification required), and outside
 * a 24h customer-initiated window, only pre-approved template messages
 * are allowed. Until that account exists, every "send to WhatsApp" action
 * in this app returns a pre-filled wa.me link that a human (customer or
 * staff) taps to open WhatsApp with the message already typed in.
 *
 * When the Cloud API is approved, swap the call sites below (see
 * routes/bookings.js) for a real API call using sendCloudApiTemplate()
 * (stubbed at the bottom, disabled by default) without changing any
 * other part of the app.
 */

const RESTAURANT_NUMBER = process.env.RESTAURANT_WHATSAPP_NUMBER;

const buildWaLink = (phoneNumber, message) => {
  const digitsOnly = String(phoneNumber).replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
};

const bookingNotificationForRestaurant = (booking) => {
  const msg =
    `New Table Booking\n` +
    `Name: ${booking.name}\n` +
    `Phone: ${booking.phone}\n` +
    `Guests: ${booking.guests}\n` +
    `Date: ${booking.date}\n` +
    `Time: ${booking.time}\n` +
    (booking.specialRequest ? `Note: ${booking.specialRequest}\n` : '') +
    `Status: ${booking.status}`;
  return buildWaLink(RESTAURANT_NUMBER, msg);
};

const bookingConfirmationForCustomer = (booking) => {
  const msg =
    `Hi ${booking.name}, this confirms your table booking at Shree Balaji Pure Veg ` +
    `for ${booking.guests} guest(s) on ${booking.date} at ${booking.time}. ` +
    `We look forward to hosting you! Reply here if you need to change anything.`;
  return buildWaLink(booking.phone, msg);
};

const partyBookingNotificationForRestaurant = (party) => {
  const msg =
    `New Party Hall Enquiry\n` +
    `Name: ${party.name}\n` +
    `Phone: ${party.phone}\n` +
    `Date: ${party.date}\n` +
    `Guests: ${party.guests}\n` +
    `Event: ${party.eventType}\n` +
    (party.budget ? `Budget: ${party.budget}\n` : '') +
    `Status: ${party.status}`;
  return buildWaLink(RESTAURANT_NUMBER, msg);
};

/**
 * Phase 3 stub - not wired up. Once you have Meta Cloud API credentials,
 * implement this to call https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages
 * with an approved template name + params, and call it from a cron job
 * for the 24h/2h reminders instead of relying on manual wa.me taps.
 */
const sendCloudApiTemplate = async () => {
  throw new Error(
    'Cloud API not configured. Set WHATSAPP_CLOUD_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID once your Meta Business account is verified.'
  );
};

module.exports = {
  buildWaLink,
  bookingNotificationForRestaurant,
  bookingConfirmationForCustomer,
  partyBookingNotificationForRestaurant,
  sendCloudApiTemplate,
};
