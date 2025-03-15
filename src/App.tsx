import { Authenticated, GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";



import {
  ErrorComponent,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { SnackbarProvider, useSnackbar } from "notistack";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import customDataProvider from "./customDataProvider"; // Remove the extra 'r' at the end

import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import CreateRecipe from "./pages/recipe-manager/create-recipe";
import RecipeList from "./pages/recipe-manager/reciple-list";

import { RecipeShow } from "./pages/recipe-manager/RecipeShow"; //

// ✅ Create a Custom Notification Provider
const CustomNotificationProvider = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return {
    open: ({ message, type }: { message: string; type: string }) => {
      enqueueSnackbar(message, {
        variant: type as "default" | "error" | "success" | "warning" | "info",
      });
    },
    close: (key: string) => {
      closeSnackbar(key);
    },
  };
};

function App() {
  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />

          {/* ✅ Wrap Everything with SnackbarProvider */}
          <SnackbarProvider maxSnack={3}>
            <RefineSnackbarProvider>
              <DevtoolsProvider>
              <Refine
            dataProvider={customDataProvider} // Use custom data provider
            notificationProvider={CustomNotificationProvider()}
            routerProvider={routerBindings}
            authProvider={authProvider}
            resources={[
                    {
                      name: "blog_posts",
                      list: "/blog-posts",
                      create: "/blog-posts/create",
                      edit: "/blog-posts/edit/:id",
                      show: "/blog-posts/show/:id",
                      meta: {
                        canDelete: true,
                      },
                    },
                    {
                      name: "categories",
                      list: "/categories",
                      create: "/categories/create",
                      edit: "/categories/edit/:id",
                      show: "/categories/show/:id",
                      meta: {
                        canDelete: true,
                      },
                    },
                    {
                      name: "recipe_manager",
                      list: "/recipe-manager",
                      create: "/recipe-manager/create",
                      edit: "/categories/edit/:id",
                      show: "/recipe-manager/show/:id", // Here, use the show route for recipe_manager
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "lmiH8U-35iscP-TUwCbG",
                  }}
                >
                  <Routes>
                    
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <ThemedLayoutV2 Header={Header}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="blog_posts" />}
                      />
                      <Route path="/blog-posts">
                        <Route index element={<BlogPostList />} />
                        <Route path="create" element={<BlogPostCreate />} />
                        <Route path="edit/:id" element={<BlogPostEdit />} />
                        <Route path="show/:id" element={<BlogPostShow />} />
                      </Route>
                      <Route path="/categories">
                        <Route index element={<CategoryList />} />
                        <Route path="create" element={<CategoryCreate />} />
                        <Route path="edit/:id" element={<CategoryEdit />} />
                        <Route path="show/:id" element={<CategoryShow />} />
                      </Route>

                      <Route path="/recipe-manager">
                        <Route index element={<RecipeList />} />
                        <Route path="create" element={<CreateRecipe />} />
                        <Route path="/recipe-manager/show/:recordId" element={<RecipeShow />} />
                        <Route path="/recipe-manager/show/:id" element={<RecipeShow />} /> {/* Show page route */}
              {/* other routes */}
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
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </RefineSnackbarProvider>
          </SnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;