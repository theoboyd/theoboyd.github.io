// Load jQuery dynamically
function loadJQuery() {
  return new Promise((resolve, reject) => {
    // Check if jQuery is already loaded
    if (typeof $ !== 'undefined') {
      resolve();
      return;
    }

    // Create script element for jQuery
    const script = document.createElement('script');
    script.src = '/scripts/jquery-3.2.1.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jQuery'));

    // Insert jQuery before dyn.js
    document.head.insertBefore(script, document.currentScript);
  });
}

// Inject common head elements
function injectCommonHead() {
  const commonHeadElements = `
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="styles/main.css" />
    <link rel="stylesheet" type="text/css" href="styles/columns.css" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
  `;

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = commonHeadElements;

  // Get all the link elements (stylesheets, icons, manifest)
  const links = tempDiv.querySelectorAll('link');

  // Get all the meta elements
  const metas = tempDiv.querySelectorAll('meta');

  // Check if each link element already exists, if not add it
  links.forEach(link => {
    const href = link.getAttribute('href');
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (!existingLink) {
      document.head.appendChild(link.cloneNode(true));
    }
  });

  // Check if each meta element already exists, if not add it
  metas.forEach(meta => {
    const charset = meta.getAttribute('charset');
    if (charset) {
      const existingMeta = document.querySelector(`meta[charset="${charset}"]`);
      if (!existingMeta) {
        document.head.appendChild(meta.cloneNode(true));
      }
    }
  });
}

// Inject logo
function injectLogo() {
  const header = document.querySelector("header.body");
  if (header) {
    header.innerHTML = `<h2><img class="thumb" src="images/theoboyd.jpg" alt="" /> Theo Boyd</h2>`;
  }
}

// Helper function to safely get XML element text content
function getElementText(parent, tagName, index = 0) {
  const elements = parent.getElementsByTagName(tagName);
  return elements.length > index ? elements[index].textContent : '';
}

// Helper function to safely get XML elements
function getElements(parent, tagName) {
  return parent.getElementsByTagName(tagName) || [];
}

// Helper function to sort blog posts by date
function sortBlogPostsByDate(blogPosts) {
  return Array.from(blogPosts).sort((a, b) => {
    const dateA = getElementText(a, 'id');
    const dateB = getElementText(b, 'id');
    return new Date(dateB) - new Date(dateA);
  }).reverse();
}

// Main initialisation
async function initialise() {
  try {
    // Wait for jQuery to load
    await loadJQuery();

    // Inject common elements
    injectCommonHead();
    injectLogo();

    // Load dynamic content
    $(document).ready(function () {
      const page = window.location.pathname;
      if (["/index.html", "/blog.html"].includes(page)) {
        $.get("/dyndata.xml", function (data) {
          try {
            if (page === "/index.html") {
              // Update blog preview
              const blogPreviewElement = document.getElementById("dyncontent_blogpreview");
              if (blogPreviewElement) {
                const blogPosts = getElements(data, "blog_post");
                if (blogPosts.length > 0) {
                  const sortedPosts = sortBlogPostsByDate(blogPosts);
                  const latestPost = sortedPosts[0];
                  const postId = getElementText(latestPost, 'id');
                  const postTitle = getElementText(latestPost, 'title');

                  if (postId && postTitle) {
                    blogPreviewElement.innerHTML = `Latest blog post: <a class="gold" href="/blog.html#${postId}">${postTitle}</a>`;
                  }
                }
              }
            }

            else if (page === "/blog.html") {
              const blogPostsElement = document.getElementById("dyncontent_blogposts");
              if (blogPostsElement) {
                const blogPosts = getElements(data, "blog_post");
                if (blogPosts.length > 0) {
                  const sortedPosts = sortBlogPostsByDate(blogPosts);

                  const postsHtml = sortedPosts.map(post => {
                    const postId = getElementText(post, 'id');
                    const postTitle = getElementText(post, 'title');
                    const postContent = getElementText(post, 'content');

                    if (postId && postTitle && postContent) {
                      // Format date from YYYYMMDD to YYYY-MM-DD
                      const formattedDate = postId.length >= 8 ?
                        `${postId.substring(6, 8)}/${postId.substring(4, 6)}/${postId.substring(0, 4)}` :
                        postId;

                      const commentLink = `<a class="grey link" style="font-weight: normal;" href="#" data-contact="bWFpbHRvOnRoZW9ib3lkK2NvbUBnbWFpbC5jb20="
                                              onclick="this.href = atob(this.dataset.contact) + '?subject=Comment%20for%20blog%20post%20%22' + '${postTitle}' + '%22%20%28' + '${formattedDate}' + '%29'">Submit a comment</a>`;
                      let commentsHtml = '';

                      const commentsContainer = getElements(post, 'comments')[0];
                      if (commentsContainer) {
                        const comments = getElements(commentsContainer, 'comment');
                        for (const comment of comments) {
                          const commentName = getElementText(comment, 'name');
                          const commentContent = getElementText(comment, 'content');

                          // If this is not the first comment, add a separator
                          if (comment !== comments[0]) {
                            commentsHtml += '<hr class="dashedhr" />';
                          }

                          commentsHtml += `
                            <div class="comment">
                              <div class="comment-name smallprint">${commentName}</div>
                              <div class="comment-content">${commentContent}</div>
                            </div>
                          `;
                        }
                      }

                      if (commentsHtml.length > 0) {
                        commentsHtml = `<br /><div class="comments"><div style="display: flex; align-items: center; gap: 10px;"><span>Comments</span><hr class="dottedhr" style="flex: 1; margin: 0;" /></div><br />${commentsHtml}</div>`;
                      }

                      return `
                        <h2 id="${postId}">${postTitle}</h2>
                        <div class="smallprint">${formattedDate} &nbsp; ${commentLink}</div>
                        <div class="blogcontent">${postContent.replace(/^    /gm, "&emsp;&emsp;").replace(/\n\n/g, "<br />").replace(/\n/g, " ")}</div>
                        ${commentsHtml}<hr />
                      `;
                    }
                    return '';
                  }).join("<br />");

                  blogPostsElement.innerHTML = postsHtml;

                  // Handle hash navigation after content is loaded
                  if (window.location.hash) {
                    const targetId = window.location.hash.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                      targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                } else {
                  blogPostsElement.innerHTML = '<p>No blog posts found.</p>';
                }
              }
            }
          } catch (error) {
            console.error('Error processing XML data.');
          }
        }).fail(function () {
          console.error('Failed to load XML data for index.');
        });
      }
    });

  } catch (error) {
    console.error('Failed to initialise:', error);
  }
}

// Start initialisation
initialise();
