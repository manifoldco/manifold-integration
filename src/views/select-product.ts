import { htm } from '@zeit/integration-utils';
import products from '../data/products';
import { DASHBOARD } from '../constants';

export default (): Promise<string> => htm`
  <Page>
    <Container>
      <Box display="flex" justifyContent="space-between">
        <H1>Choose a service</H1>
        <Box>
          <Link action="${DASHBOARD}">← Back to my resources</Link>
        </Box>
      </Box>
    </Container>
    <Container>
      ${products.map(
        ({ label, logoUrl, name, tagline, tags }) => htm`
        <Fieldset height="100%" margin="0">
          <FsContent>
            <Box display="flex" justifyContent="space-between">
              <Box display="grid" gridColumnGap="1.25rem" gridTemplateColumns="min-content auto min-content">
                <Box height="40px" width="40px" borderRadius="3px" overflow="hidden" >
                  <Img src="${logoUrl}" width="100%" height="auto" />
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
              <Box display="flex">
                <Box marginTop="auto">
                  <Button small action="${`product-${label}`}">Create resource →</Button>
                </Box>
              </Box>
            </Box>
          </FsContent>
        </Fieldset>
        `
      )}
    </Container>
  </Page>
`;
