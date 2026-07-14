import { Package } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function Products() {
  return (
    <div>
      <PageHeader title="Sản phẩm" description="Quản lý danh mục và tồn kho sản phẩm." />
      <EmptyState
        icon={Package}
        title="Chưa có giao diện quản lý"
        description="Trang danh sách và chỉnh sửa sản phẩm đang được xây dựng."
      />
    </div>
  );
}
