import { getOwnerInvoicesList } from '../services';
import { OwnerInvoicesClient } from './OwnerInvoicesClient';

interface Props {
  ownerUserId: string;
}

export async function OwnerInvoicesTable({ ownerUserId }: Props) {
  const rows = await getOwnerInvoicesList(ownerUserId);
  return <OwnerInvoicesClient rows={rows} />;
}
