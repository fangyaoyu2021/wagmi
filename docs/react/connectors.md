<script setup>
import { getSidebar } from '../.vitepress/sidebar'

const connectors = getSidebar()['/react']
  .find(x => x.text === 'API').items
  .find(x => x.link === '/react/connectors').items
  .sort((a, b) => a.text.localeCompare(b.text))
</script>

# Connectors

Connectors for popular wallet providers and protocols.

## Import

```ts
import { injected } from 'wagmi/connectors'
```

## Built-In Connectors

Available via the `'wagmi/connectors'` entrypoint.

<ul>
  <li v-for="connector of connectors">
    <a :href="connector.link">{{ connector.text }}</a>
  </li>
</ul>