import {Page} from './Page';

export const Post = ({children, title}) => (
  <Page>
    <main>
      <article>
        <h1>{title}</h1>
        {children}
      </article>
    </main>
  </Page>
);
