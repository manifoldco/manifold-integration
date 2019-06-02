import { htm } from '@zeit/integration-utils';

import { RouteParams } from '../api/router';
import { SELECT_PRODUCT } from '../constants';
import { $ } from '../utils/currency';

/* eslint-disable prefer-destructuring */

export default async (attrs: RouteParams): Promise<string> => {
  const { payload, client } = attrs;
  const resources = payload.projectId ? await client.getResources(payload.configurationId, payload.projectId) : [];

  // View: select a project
  if (!payload.projectId) {
    return htm`
      <Page>
        <Box display="flex" justifyContent="space-between" marginBottom="1rem" borderBottom="1px solid #eaeaea" marginBottom="1rem" paddingBottom="1rem">
          <Box display="flex" justifyContent="space-between">
            <H1>Manifold services</H1>
            <Box marginLeft="1rem">
              <ProjectSwitcher />
            </Box>
          </Box>
          <Button small disabled>+ Add a new service</Button>
        </Box>
        <Box textAlign="center" marginTop="2rem">
          <P>Which project do you want to add a service to?</P>
          <Box marginTop="1rem">
            <ProjectSwitcher />
          </Box>
        </Box>
      </Page>`;
  }

  // View: no resources for project
  if (!resources.length) {
    return htm`
      <Page>
        <Box display="flex" justifyContent="space-between" marginBottom="1rem" borderBottom="1px solid #eaeaea" marginBottom="1rem" paddingBottom="1rem">
          <Box display="flex" justifyContent="space-between">
            <H1>Manifold services</H1>
            <Box marginLeft="1rem">
              <ProjectSwitcher />
            </Box>
          </Box>
          <Button action="${SELECT_PRODUCT}" small highlight>+ Add a new service</Button>
        </Box>
        <Box marginTop="2rem" textAlign="center">
          <P>
            No resources found for ${
              payload.project ? htm`<B>${payload.project.name}</B>` : 'this project'
            }. <Link action="${SELECT_PRODUCT}">Add a new service</Link> to get started.
          </P>
        </Box>
      </Page>
    `;
  }

  // View: default view with resources
  return htm`
    <Page>
      <Box display="flex" justifyContent="space-between" marginBottom="1rem" borderBottom="1px solid #eaeaea" marginBottom="1rem" paddingBottom="1rem">
        <Box display="flex" justifyContent="space-between">
          <H1>Manifold services</H1>
          <Box marginLeft="1rem">
            <ProjectSwitcher />
          </Box>
        </Box>
        <Button action="${SELECT_PRODUCT}" small highlight>+ Add a new service</Button>
      </Box>

      ${resources.map((resource: Manifold.Resource) => {
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
                  <Box color="#737373">
                    ${resource.plan.name} ${$(resource.plan.cost)}
                    <Box display="inline" marginLeft="-0.25em">/mo</Box></Box>
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
      })}
    </Page>
  `;
};
