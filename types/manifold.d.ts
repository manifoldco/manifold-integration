declare namespace Manifold {
  interface Error {
    message: string;
  }

  type Tag = string;

  interface ValueProp {
    header: string;
    body: string;
  }

  interface ProductFeatures {
    name: string;
    valueName: string;
  }

  interface Product {
    id: string;
    label: string;
    name: string;
    tagline: string;
    logoUrl: string;
    valueProps: ValueProp[];
    tags: Tag[];
    plans: Manifold.Plan[];
  }

  interface Plan {
    id: string;
    label: string;
    name: string;
    cost: number;
    regions: string[];
    features: ProductFeatures[];
  }

  interface Resource {
    name: string;
    plan: Plan;
    product: Product;
  }

  interface AuthToken {
    id: string;
    body: AuthTokenBody;
  }

  interface AuthTokenBody {
    token: string;
  }

  interface User {
    id: string;
    body: UserBody;
  }

  interface UserBody {
    name: string;
    email: string;
  }

  interface Resource {
    id: string;
    body: ResourceBody,
  }

  interface ResourceBody {
    name: string;
    label: string;
    product_id: string;
    plan_id: string;
    region_id: string;
    annotations: {[s: string]: string[]}
  }

  interface AuthorizationCode {
    id: string;
    body: AuthorizationCodeBody,
  }

  interface AuthorizationCodeBody {
    redirect_uri: string;
  }
}
