import {
  DateField,
  NumberField,
  Show,
  TagField,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography } from "antd";

const { Title } = Typography;

export const OrderShow = () => {
  const { query: queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const { query: shopQuery } = useOne({
    resource: "shops",
    id: record?.shop_id || "",
    queryOptions: {
      enabled: !!record,
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
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />
      <Title level={5}>Shop</Title>
      {shopQuery.isLoading ? <>Loading...</> : <TextField value={shopQuery.data?.data?.name} />}
      <Title level={5}>Source</Title>
      <TagField color={getSourceColor(record?.source)} value={record?.source} />
      <Title level={5}>Status</Title>
      <TagField color={getStatusColor(record?.status)} value={record?.status} />
      <Title level={5}>Total Amount</Title>
      <NumberField
        value={record?.total_amount}
        options={{
          style: "currency",
          currency: record?.currency || "IDR",
        }}
      />
      <Title level={5}>Currency</Title>
      <TextField value={record?.currency} />
      <Title level={5}>Buyer Name</Title>
      <TextField value={record?.buyer_name || "-"} />
      <Title level={5}>Buyer Contact</Title>
      <TextField value={record?.buyer_contact || "-"} />
      <Title level={5}>Note</Title>
      <TextField value={record?.note || "-"} />
      <Title level={5}>Created At</Title>
      <DateField value={record?.created_at} format="LLL" />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updated_at} format="LLL" />
    </Show>
  );
};
