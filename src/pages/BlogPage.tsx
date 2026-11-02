import React, { useEffect } from 'react';

export const BlogPage: React.FC = () => {
  useEffect(() => {
    (window as any).__reactBlogMounted = true;
    document.title = 'Chess Blog, Puzzles & Quotes | Marwadi Chess';

    // Clear previous lists on mount to guarantee fresh, pristine state
    if (typeof (window as any).$ !== 'undefined') {
      (window as any).$('#category-list').empty();
      (window as any).$('#related-topics-list').empty();
    }

    const timer = setTimeout(() => {
      if ((window as any).initBlog) {
        (window as any).initBlog();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      (window as any).__reactBlogMounted = false;
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1400px', margin: '0 auto' }}>
          <div id="blog-heading-container" style={{ marginBottom: '16px', paddingTop: '16px' }}>
            <h1 id="blog-page-heading" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
              Blogs
            </h1>
          </div>
          <div className="row">
            <div className="col-md-8" id="blogs-container">
              <div className="text-center" id="loading-indicator" style={{ padding: '40px', textAlign: 'center' }}>
                <i className="fa fa-spinner fa-spin fa-3x fa-fw" style={{ color: '#38bdf8' }}></i>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="row">
                <div className="col-md-12 margin-bottom" style={{ marginBottom: '16px' }}>
                  <div className="input-group input-group-lg" style={{ display: 'flex' }}>
                    <input
                      type="text"
                      id="txtSearch"
                      className="form-control"
                      placeholder="search blog here"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '6px 0 0 6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: '#0f172a',
                        color: '#f8fafc',
                      }}
                    />
                    <button
                      id="btnSearch"
                      className="btn btn-default bg-f2"
                      style={{
                        padding: '10px 18px',
                        borderRadius: '0 6px 6px 0',
                        border: '1px solid #2563eb',
                        background: '#2563eb',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12" style={{ marginBottom: '16px' }}>
                  <div className="box box-solid box-black" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div className="box-header" style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '10px' }}>
                      Category
                    </div>
                    <ul className="mrgin-top10 abc row" id="category-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}></ul>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12" style={{ marginBottom: '16px' }}>
                  <div className="box box-solid box-black" style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '14px' }}>
                    <div className="box-header" style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '10px' }}>
                      Related Topics List
                    </div>
                    <div className="box-body product-list">
                      <div id="related-topics-list"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div style={{ textAlign: 'center' }}>
                    <iframe
                      src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fm1chess%2F&tabs=timeline&width=336&height=400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                      width="100%"
                      height="400"
                      style={{ border: 'none', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                      scrolling="no"
                      frameBorder={0}
                      allow="encrypted-media"
                      title="Marwadi Chess FB"
                    />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <a
                      href="https://twitter.com/ChessMarwadi?ref_src=twsrc%5Etfw"
                      className="twitter-follow-button"
                      data-size="large"
                      data-show-count="false"
                      style={{
                        display: 'inline-block',
                        background: '#ffffff',
                        color: '#000000',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textDecoration: 'none',
                      }}
                    >
                      Follow @Marwadi Chess
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
