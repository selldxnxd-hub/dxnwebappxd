import { Order } from '../types';

/**
 * Sends a highly detailed and beautifully formatted notification to the Telegram Bot.
 * It operates silently in the background, ensuring any errors do not disrupt the user's checkout flow.
 */
export async function sendTelegramOrderNotification(order: Order): Promise<boolean> {
  const BOT_TOKEN = '8064568263:AAEwlXPUFjHyYh32nDSAc_8O1LvOZBQy9Og';
  const CHAT_ID = '7285888263';

  try {
    const dateStr = new Date(order.createdAt).toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Format items list
    const itemsFormatted = order.items
      .map(
        (item, index) =>
          `🛍️ ${index + 1}. *${item.title}*\n` +
          `   Quantity: ${item.quantity} | Price: ৳${item.price}\n` +
          (item.selectedColor ? `   Color: ${item.selectedColor}\n` : '')
      )
      .join('\n');

    // Human-readable payment method
    let payMethodHuman = order.paymentMethod.toUpperCase();
    if (order.paymentMethod === 'bkash') payMethodHuman = '🇧🇩 bKash (বিকাশ)';
    else if (order.paymentMethod === 'nagad') payMethodHuman = '🇧🇩 Nagad (নগদ)';
    else if (order.paymentMethod === 'rocket') payMethodHuman = '🇧🇩 Rocket (রকেট)';
    else if (order.paymentMethod === 'cod') payMethodHuman = '💵 Cash on Delivery (ক্যাশ অন ডেলিভারি)';

    // Build the MarkdownV2-safe message
    // MarkdownV2 requires escaping certain special characters: _ * [ ] ( ) ~ ` > # + - = | { } . !
    const escapeMarkdown = (text: string) => {
      return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
    };

    const msg = `🎉 *NEW ORDER PLACED \\(নতুন অর্ডার\\)* 🎉\n\n` +
      `🆔 *Order ID:* \`${escapeMarkdown(order.id)}\`\n` +
      `📅 *Date \\(Time\\):* ${escapeMarkdown(dateStr)}\n\n` +
      `👤 *CUSTOMER DETAILS \\(গ্রাহকের তথ্য\\)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `▪️ *Name:* ${escapeMarkdown(order.customerName)}\n` +
      `▪️ *Phone:* \`${escapeMarkdown(order.customerPhone)}\`\n` +
      `▪️ *District:* ${escapeMarkdown(order.district || 'N/A')}\n` +
      `▪️ *Upazila:* ${escapeMarkdown(order.upazila || 'N/A')}\n` +
      `▪️ *Area:* ${escapeMarkdown(order.area || 'N/A')}\n` +
      `▪️ *Address:* ${escapeMarkdown(order.address || 'N/A')}\n\n` +
      `📦 *ITEMS ORDERED \\(অর্ডার করা পণ্য\\)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${escapeMarkdown(itemsFormatted)}\n\n` +
      `💳 *PAYMENT INFO \\(পেমেন্ট বিবরণ\\)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `▪️ *Method:* ${escapeMarkdown(payMethodHuman)}\n` +
      (order.senderNumber ? `▪️ *Sender Mobile:* \`${escapeMarkdown(order.senderNumber)}\`\n` : '') +
      (order.transactionId ? `▪️ *Txn ID:* \`${escapeMarkdown(order.transactionId)}\`\n` : '') +
      (order.amountPaid ? `▪️ *Amount Paid:* ৳${escapeMarkdown(order.amountPaid.toString())}\n` : '') +
      `\n` +
      `💰 *BILLING SUMMARY \\(টাকার বিবরণ\\)*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `▪️ *Subtotal:* ৳${escapeMarkdown(order.subtotal.toString())}\n` +
      `▪️ *Discount:* ৳${escapeMarkdown(order.discount.toString())}\n` +
      `▪️ *Delivery Cost:* ৳${escapeMarkdown(order.shipping.toString())}\n` +
      `▪️ *Total Bill:* ৳${escapeMarkdown(order.total.toString())}\n\n` +
      `🚀 *Please review and process this order in the admin panel\\!*`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg,
        parse_mode: 'MarkdownV2',
      }),
    });

    if (!response.ok) {
      console.error('Telegram notification responded with error status:', response.status);
      // Fallback to simple HTML format just in case MarkdownV2 parsing fails
      const fallbackMsg = `🎉 NEW ORDER PLACED (নতুন অর্ডার) 🎉\n\n` +
        `Order ID: ${order.id}\n` +
        `Date: ${dateStr}\n\n` +
        `CUSTOMER DETAILS\n` +
        `--------------------\n` +
        `Name: ${order.customerName}\n` +
        `Phone: ${order.customerPhone}\n` +
        `District: ${order.district || 'N/A'}\n` +
        `Upazila: ${order.upazila || 'N/A'}\n` +
        `Area: ${order.area || 'N/A'}\n` +
        `Address: ${order.address || 'N/A'}\n\n` +
        `ITEMS ORDERED\n` +
        `--------------------\n` +
        order.items.map((it, idx) => `${idx + 1}. ${it.title} x${it.quantity} (৳${it.price})`).join('\n') + `\n\n` +
        `PAYMENT INFO\n` +
        `--------------------\n` +
        `Method: ${payMethodHuman}\n` +
        (order.senderNumber ? `Sender: ${order.senderNumber}\n` : '') +
        (order.transactionId ? `Txn ID: ${order.transactionId}\n` : '') +
        (order.amountPaid ? `Amount Paid: ৳${order.amountPaid}\n` : '') +
        `\n` +
        `BILLING SUMMARY\n` +
        `--------------------\n` +
        `Subtotal: ৳${order.subtotal}\n` +
        `Discount: ৳${order.discount}\n` +
        `Delivery Cost: ৳${order.shipping}\n` +
        `Total Bill: ৳${order.total}\n\n` +
        `Please process this order in your admin dashboard.`;

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: fallbackMsg,
        }),
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}
