import { htm } from '@zeit/integration-utils';

import products from '../data/products';
import { RouteParams } from '../api/router';
import { $ } from '../utils/currency';
import { SELECT_PRODUCT } from '../constants';

export default (attrs: RouteParams): Promise<string> => {
  if (!attrs.params) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  const productLabel = attrs.params[0];
  const product = products.find((prod: Manifold.Product): boolean => prod.label === productLabel);

  if (!product) {
    return htm`
      <Page>
        <Notice type="error">Product not found</Notice>
      </Page>
    `;
  }

  const { label, logoUrl, name, plans, tagline, tags, valueProps } = product;

  return htm`
    <Page>
      <Fieldset>
        <FsContent>
          <Box display="grid" gridColumnGap="1.5rem" gridTemplateColumns="25% auto">
            <Box paddingTop="1rem" alignItems="center" display="flex" flexDirection="column" textAlign="center">
              <Box borderRadius="0.375rem" width="72px" height="72px" overflow="hidden">
                <Img src="${logoUrl}" height="auto" width="100%"/>
              </Box>
              <Box marginTop="1rem">
                <H1>${name}</H1>
                <Box fontSize="0.75rem" textTransform="uppercase" fontWeight="500" letterSpacing="1px" color="#777">
                  ${[...tags].sort((a, b) => a.localeCompare(b)).join(' / ')}
                </Box>
              </Box>
              <Box marginTop="1rem">
                <Link href="${`https://manifold.co/services/${label}`}" target="_blank">
                <Button secondary small>
                  More details
                  <Box alignItems="center" display="inline-flex" fontSize="0.875em" height="1.375em" lineHeight="1" marginLeft="0.1em" justifyContent="center" width="1.375em">↗︎</Box>︎
                </Button>
                </Link>
              </Box>
            </Box>
            <Box paddingTop="1rem">
              <H2>${tagline}</H2>
              ${valueProps.map(
                valueProp => htm`
                  <Box marginBottom="1.5rem" marginTop="1.5rem">
                    <B>${valueProp.header}</B>
                    <BR />
                    ${valueProp.body}
                  </Box>
                `
              )}
              <Box marginTop="2rem">
                ${plans.map(
                  plan => htm`
                    <Fieldset>
                      <FsContent>
                        <Box fontSize="0.75rem" textTransform="uppercase" fontWeight="500" letterSpacing="1px" color="#777">
                          Plan
                        </Box>
                        <H2>
                          ${plan.name}
                          <Box display="inline" color="#777">${$(
                            plan.cost
                          )}<Box display="inline" marginLeft="-0.25em">/mo</Box></Box>
                        </H2>
                        ${plan.features.map(
                          (feature, index) => htm`
                            <Box backgroundColor="${
                              index % 2 === 0 ? '#fafafa' : 'transparent'
                            }" display="grid" gridTemplateColumns="1fr 1fr" padding="0.25rem" paddingTop="0.25rem">
                                <B>${feature.name}</B>
                              <Box>${feature.valueName}</Box>
                            </Box>
                          `
                        )}
                      </FsContent>
                    </Fieldset>
                  `
                )}
              </Box>
            </Box>
          </Box>
        </FsContent>
        <FsFooter>
          <Box display="flex" justifyContent="space-between" alignItems="flex-end" width="100%">
            <Box fontSize="14px" paddingLeft="0.5rem">
              <Link action="${SELECT_PRODUCT}">← Back to all services</Link>
            </Box>
            <Box display="flex" alignItems="flex-end">
              <Box marginRight="1rem" fontSize="14px" alignItems="center">
                <P>Resource name</P>
                <Box fontSize="10px">Must start with a letter and contain no spaces. Underscores and dashes allowed.</Box>
                <Box minWidth="250px">
                  <Input width="100%" name="resourceName" placeholder="messaging, logging, etc"/>
                </Box>
              </Box>
              <Button highlight action="${`provision-${product.label}`}">+ Create Resource</Button>
            </Box>
          </Box>
        </FsFooter>
      </Fieldset>
    </Page>
  `;
};
