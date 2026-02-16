/**
 * AI assistant config: company contact info and hours for scheduling prompts.
 * Customize for your business (Pakistan).
 */

export const AI_CONFIG = {
  company: {
    name: 'RECON Solutions',
    phone: process.env.AI_COMPANY_PHONE ?? '+92 300 1234567',
    email: process.env.AI_COMPANY_EMAIL ?? 'info@reconsolutions.com',
    bookingUrl: process.env.AI_BOOKING_URL ?? 'https://reconsolutions.com/appointments',
    website: process.env.AI_COMPANY_WEBSITE ?? 'https://reconsolutions.com',
  },
  hours: {
    weekdays: process.env.AI_HOURS_WEEKDAYS ?? 'Mon–Fri, 9:00 AM – 6:00 PM (PKT)',
    saturday: process.env.AI_HOURS_SATURDAY ?? 'Sat, 10:00 AM – 2:00 PM (PKT)',
    timezone: 'PKT',
  },
} as const;

/**
 * Returns the scheduling reminder text appended to the system prompt when the user asks about booking.
 */
export function getSchedulingInstructions(): string {
  const { company, hours } = AI_CONFIG;
  return `

IMPORTANT: The user is asking about scheduling. Remember:
- You CANNOT schedule appointments or book consultations
- You CANNOT access calendars or send confirmation emails
- Direct them to these contact methods:
  Phone: ${company.phone}
  Booking: ${company.bookingUrl}
  Hours: ${hours.weekdays}
- Do NOT pretend to have scheduled anything
- Do NOT offer specific time slots as if you can book them
- Do NOT say "I'll send you a confirmation email"
- Instead say something like: "To schedule your consultation, please call us at ${company.phone} or book online at ${company.bookingUrl}"`;
}
