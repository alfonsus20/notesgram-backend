export class WithdrawCallbackDto {
  status: { code: string; message: string };
  tx_status_description: string;
  amount: number;
  recipient_name: string;
  recipient_bank: string;
  recipient_account: string;
  trx_id: string;
  partner_trx_id: string;
  timestamp: string;
  created_date: string;
  last_updated_date: string;
}
