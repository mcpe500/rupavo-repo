import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import authProvider from "./authProvider";
import { Title } from "./components/title";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  ShopCreate,
  ShopEdit,
  ShopList,
  ShopShow,
} from "./pages/shops";
import {
  ProductCreate,
  ProductEdit,
  ProductList,
  ProductShow,
} from "./pages/products";
import {
  OrderCreate,
  OrderEdit,
  OrderList,
  OrderShow,
} from "./pages/orders";
import {
  AIReportList,
  AIReportShow,
} from "./pages/ai-reports";
import { supabaseClient } from "./utility";

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider(supabaseClient)}
                liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerProvider}
                notificationProvider={useNotificationProvider}
                resources={[
                  {
                    name: "shops",
                    list: "/shops",
                    create: "/shops/create",
                    edit: "/shops/edit/:id",
                    show: "/shops/show/:id",
                    meta: {
                      canDelete: true,
                      label: "Shops",
                    },
                  },
                  {
                    name: "products",
                    list: "/products",
                    create: "/products/create",
                    edit: "/products/edit/:id",
                    show: "/products/show/:id",
                    meta: {
                      canDelete: true,
                      label: "Products",
                    },
                  },
                  {
                    name: "orders",
                    list: "/orders",
                    create: "/orders/create",
                    edit: "/orders/edit/:id",
                    show: "/orders/show/:id",
                    meta: {
                      canDelete: true,
                      label: "Orders",
                    },
                  },
                  {
                    name: "ai_reports",
                    list: "/ai-reports",
                    show: "/ai-reports/show/:id",
                    meta: {
                      canDelete: false,
                      label: "AI Reports",
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "iPCqlI-0YsTuN-b1lc0S",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayout
                          Header={Header}
                          Sider={(props) => <ThemedSider {...props} fixed Title={Title} />}
                          Title={Title}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource="shops" />}
                    />
                    <Route path="/shops">
                      <Route index element={<ShopList />} />
                      <Route path="create" element={<ShopCreate />} />
                      <Route path="edit/:id" element={<ShopEdit />} />
                      <Route path="show/:id" element={<ShopShow />} />
                    </Route>
                    <Route path="/products">
                      <Route index element={<ProductList />} />
                      <Route path="create" element={<ProductCreate />} />
                      <Route path="edit/:id" element={<ProductEdit />} />
                      <Route path="show/:id" element={<ProductShow />} />
                    </Route>
                    <Route path="/orders">
                      <Route index element={<OrderList />} />
                      <Route path="create" element={<OrderCreate />} />
                      <Route path="edit/:id" element={<OrderEdit />} />
                      <Route path="show/:id" element={<OrderShow />} />
                    </Route>
                    <Route path="/ai-reports">
                      <Route index element={<AIReportList />} />
                      <Route path="show/:id" element={<AIReportShow />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route
                      path="/login"
                      element={
                        <AuthPage
                          type="login"
                          title={<Title collapsed={false} />}
                          formProps={{
                            initialValues: {
                              email: "info@refine.dev",
                              password: "refine-supabase",
                            },
                          }}
                        />
                      }
                    />
                    <Route
                      path="/register"
                      element={<AuthPage type="register" title={<Title collapsed={false} />} />}
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" title={<Title collapsed={false} />} />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
