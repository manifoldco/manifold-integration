declare namespace Manifold {
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
    valueProps: [ValueProp];
    tags: [Tag];
    plans: [Manifold.Plan];
  }

  interface Plan {
    id: string;
    label: string;
    name: string;
    regions: [string];
    features: [ProductFeatures];
  }
}
