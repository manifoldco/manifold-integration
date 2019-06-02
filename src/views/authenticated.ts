import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';
import { SELECT_PRODUCT } from '../constants';
import { $ } from '../utils/currency';

/* eslint-disable prefer-destructuring */

export default async (attrs: RouteParams): Promise<string> => {
  const { payload, client } = attrs;
  const resources = payload.projectId ? await client.getResources(payload.configurationId, payload.projectId) : [];

  const resourcesDisplay = !resources.length
    ? htm`
      <Box marginBottom="1rem" backgroundColor="#fff" border="solid rgb(234, 234, 234) 1px" borderRadius="0.4rem" padding="0.5rem 1rem">
        You have no resources yet. <Link action="${SELECT_PRODUCT}">Add a new service</Link> to get started.
      </Box>
      `
    : resources.map(
        (resource: Manifold.Resource): string => {
          let name = htm`<Link action="${`resource-details-${resource.id}`}">${resource.body.name}</Link>`;
          let button = htm`<Button small action="${`resource-details-${resource.id}`}">View resource</Button>`;

          if (resource.state === 'provisioning') {
            name = resource.body.name;
            button = htm`<Button small disabled>Preparing…</Button>`;
          } else if (resource.state === 'deprovisioning') {
            name = resource.body.name;
            button = htm`<Button small disabled>Deprovisioning…</Button>`;
          }

          return htm`
          <Box marginBottom="1rem">
            <Fieldset>
              <FsContent>
                <Box display="flex" alignItems="center" paddingBottom="1rem" paddingLeft="0.15rem">
                  <Box marginRight="0.5rem" width="10px" height="10px" display="block" background="linear-gradient(237deg, #00FF89 0%, #329DD1 100%)" borderRadius="50%"></Box>
                  <H2>${name}</H2>
                </Box>
                ${
                  resource.product && resource.plan
                    ? htm`<Box display="flex" alignItems="center" justifyContent="flex-start">
                  <Box marginRight="0.5rem" borderRadius="3px" overflow="hidden" width="24px" height="24px">
                    <Img src="${resource.product.logoUrl}" width="100%" height="auto"/>
                  </Box>
                  <Box marginRight="0.5rem">${resource.product.name}</Box>
                  <Box color="#737373">${resource.plan.name} ${$(
                        resource.plan.cost
                      )}<Box display="inline" marginLeft="-0.25em">/mo</Box></Box>
                </Box>`
                    : ''
                }
              </FsContent>
              <FsFooter>
                ${button}
              </FsFooter>
            </Fieldset>
          </Box>
        `;
        }
      );

  return htm`
    <Page>
      <Box display="flex" justifyContent="space-between" marginBottom="1rem">
        <H1>Manifold services</H1>
        <ProjectSwitcher />
        <Button action="${SELECT_PRODUCT}" small highlight disabled="${
    payload.projectId ? 'false' : 'true'
  }">+ Add a new service</Button>
      </Box>
      ${
        payload.projectId
          ? resourcesDisplay
          : htm`
        <Box marginBottom="1rem">
          <Notice type="message">
            Please select a project to get started with Manifold.
          </Notice>
        </Box>
      `
      }
    </Page>
  `;
};
