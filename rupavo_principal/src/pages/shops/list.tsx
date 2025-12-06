import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  TagField,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";

export const ShopList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column dataIndex="name" title="Shop Name" />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column dataIndex="tagline" title="Tagline" />
        <Table.Column
          dataIndex="storefront_published"
          title="Published"
          render={(value: boolean) => (
            <TagField color={value ? "green" : "red"} value={value ? "Yes" : "No"} />
          )}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created At"
          render={(value: any) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
