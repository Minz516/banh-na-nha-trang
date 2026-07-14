import { Store as StoreIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function Store() {
  return (
    <div>
      <PageHeader title="Cửa hàng" description="Thông tin cửa hàng, mã giảm giá và bán hàng trực tiếp." />
      <EmptyState
        icon={StoreIcon}
        title="Chưa có giao diện quản lý"
        description="Thông tin liên hệ, voucher và lên đơn tại quầy đang được xây dựng."
      />
    </div>
  );
}
