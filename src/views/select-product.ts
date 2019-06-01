import { htm } from '@zeit/integration-utils';
import products from '../data/products';

export default () => htm`
  <Page>
    <Container>
      <H1>Manifold services</H1>
      ${products.map(
        ({ label, logoUrl, name, tagline, tags }) => htm`
        <Fieldset height="100%" margin="0">
          <FsContent>
            <Box display="grid" gridColumnGap="1.25rem" gridTemplateColumns="min-content auto min-content">
              <Box height="64px" borderRadius="0.375rem" overflow="hidden" >
                <Img src="${logoUrl}" width="64" height="64" />
              </Box>
              <Box>
                <H2>
                  ${name}
                  <Box fontSize="0.75rem" textTransform="uppercase" fontWeight="500" letterSpacing="1px" color="#777">
                    ${[...tags].sort((a, b) => a.localeCompare(b)).join(' / ')}
                  </Box>
                </H2>
                <P>${tagline}</P>
              </Box>
            </Box>
            <Box display="flex" justifyContent="flex-end" marginTop="0.5rem">
              <Button small action="product-${label}">Create resource →</Button>
            </Box>
          </FsContent>
        </Fieldset>
        `
      )}
    </Container>
  </Page>
`;
