import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  NumberField,
  ShowButton,
  TagField,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table } from "antd";

export const OrderList = () => {
  const { result, tableProps } = useTable({
    syncWithLocation: true,
    meta: {
      select: "*, shops(id,name)",
    },
  });

  const {
    result: { data: shops },
    query: { isLoading: shopsIsLoading },
  } = useMany({
    resource: "shops",
    ids:
      result?.data?.map((item) => item?.shop_id).filter(Boolean) ?? [],
    queryOptions: {
      enabled: !!result?.data,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "draft":
        return "blue";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getSourceColor = (source: string) => {
    return source === "storefront" ? "purple" : "cyan";
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column
          dataIndex="shop_id"
          title="Shop"
          render={(value) =>
            shopsIsLoading ? (
              <>Loading...</>
            ) : (
              shops?.find((item) => item.id === value)?.name
            )
          }
        />
        <Table.Column
          dataIndex="source"
          title="Source"
          render={(value: string) => (
            <TagField color={getSourceColor(value)} value={value} />
          )}
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value: string) => (
            <TagField color={getStatusColor(value)} value={value} />
          )}
        />
        <Table.Column
          dataIndex="total_amount"
          title="Total"
          render={(value: number) => (
            <NumberField
              value={value}
              options={{
                style: "currency",
                currency: "IDR",
              }}
            />
          )}
        />
        <Table.Column dataIndex="buyer_name" title="Buyer" />
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
