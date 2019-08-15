import Layout from '../components/MyLayout.js';
import { withRouter } from 'next/router';

export default withRouter(props => (
  <Layout>
    <h1>{props.router.query.title}</h1>
    <style jsx global>{`
      .markdown {
        font-family: 'Arial';
      }

      .markdown a {
        text-decoration: none;
        color: blue;
      }

      .markdown a:hover {
        opacity: 0.6;
      }

      .markdown h3 {
        margin: 0;
        padding: 0;
        text-transform: uppercase;
      }
    `}</style>
  </Layout>
));
