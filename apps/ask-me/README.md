# Ask Me

## Requirements

### Cloudflare Vectorize

Setup metadata index with the following command:

```bash
npx wrangler vectorize create-metadata-index [index-name] --property-name=series --type=string
npx wrangler vectorize create-metadata-index [index-name] --property-name=publishedAt --type=number
npx wrangler vectorize create-metadata-index [index-name] --property-name=type --type=string
```
