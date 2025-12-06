import {
  DateField,
  NumberField,
  Show,
  TagField,
  TextField,
} from "@refinedev/antd";
import { useOne, useShow } from "@refinedev/core";
import { Typography, Image } from "antd";

const { Title } = Typography;

export const ProductShow = () => {
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

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />
      <Title level={5}>Shop</Title>
      {shopQuery.isLoading ? <>Loading...</> : <TextField value={shopQuery.data?.data?.name} />}
      <Title level={5}>Product Name</Title>
      <TextField value={record?.name} />
      <Title level={5}>Slug</Title>
      <TextField value={record?.slug || "-"} />
      <Title level={5}>Description</Title>
      <TextField value={record?.description || "-"} />
      <Title level={5}>Price</Title>
      <NumberField
        value={record?.price}
        options={{
          style: "currency",
          currency: "IDR",
        }}
      />
      <Title level={5}>Cost Price</Title>
      {record?.cost_price ? (
        <NumberField
          value={record?.cost_price}
          options={{
            style: "currency",
            currency: "IDR",
          }}
        />
      ) : (
        <TextField value="-" />
      )}
      <Title level={5}>Image</Title>
      {record?.image_url ? (
        <Image src={record?.image_url} alt={record?.name} width={200} />
      ) : (
        <TextField value="No image" />
      )}
      <Title level={5}>Sort Order</Title>
      <NumberField value={record?.sort_order || 0} />
      <Title level={5}>Active</Title>
      <TagField
        color={record?.is_active ? "green" : "red"}
        value={record?.is_active ? "Yes" : "No"}
      />
      <Title level={5}>Created At</Title>
      <DateField value={record?.created_at} format="LLL" />
      <Title level={5}>Updated At</Title>
      <DateField value={record?.updated_at} format="LLL" />
    </Show>
  );
};
