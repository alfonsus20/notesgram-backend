export class PaymentCallbackDto {
  partner_tx_id: string;
  amount: number;
  sender_phone: string;
  sender_note: null | string;
  settlement_status: string;
  created: Date;
  tx_ref_number: string;
  description: null | string;
  sender_name: string;
  settlement_time: Date;
  paid_amount: number;
  expiration: Date;
  is_invoice: boolean;
  updated: Date;
  payment_method: string;
  email: string;
  status: 'success' | 'failed' | 'processing';
  sender_bank: string;
  settlement_type: string;
}
