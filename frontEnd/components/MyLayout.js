import Header from './Header'

const layoutStyle = {
  padding: 20,
  backgroundColor: '#e5e5e5',
  minHeight: '100vh'
  // border: '1px solid #DDD',
  // borderRadius: 5
};

const Layout = (props) => (
  <div style={layoutStyle}>
    {/*<Header />*/}
    {props.children}
  </div>
)

export default Layout
