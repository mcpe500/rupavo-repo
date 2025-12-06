import {
  DateField,
  List,
  ShowButton,
  TagField,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useMany } from "@refinedev/core";
import { Space, Table } from "antd";

export const AIReportList = () => {
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

  const getGranularityColor = (granularity: string) => {
    switch (granularity) {
      case "daily":
        return "blue";
      case "weekly":
        return "green";
      case "monthly":
        return "purple";
      case "custom":
        return "orange";
      default:
        return "default";
    }
  };

  return (
    <List canCreate={false}>
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
          dataIndex="granularity"
          title="Period Type"
          render={(value: string) => (
            <TagField color={getGranularityColor(value)} value={value} />
          )}
        />
        <Table.Column
          dataIndex="period_start"
          title="Period Start"
          render={(value: any) => <DateField value={value} format="LL" />}
        />
        <Table.Column
          dataIndex="period_end"
          title="Period End"
          render={(value: any) => <DateField value={value} format="LL" />}
        />
        <Table.Column
          dataIndex="created_at"
          title="Generated At"
          render={(value: any) => <DateField value={value} format="LLL" />}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
