async function handleProfile(profileCode) {
  switch (profileCode) {
    case 1:
      return "/a1.png";
    case 2:
      return "/a2.png";
    case 3:
      return "/a3.png";
    case 4:
      return "/a4.png";
    default:
      return "/a1.png";
  }
}

// Modify the loadPosts function to handle Blob conversion
async function loadPosts() {

  document.getElementById('loadingSpinner').classList.remove('hidden');

  try {
    const res = await fetch('/posts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    for (const post of data) {
      // Convert img_data Buffer to Uint8Array
      const uint8Array = new Uint8Array(post.img_data.data);
      // Create Blob from Uint8Array
      const blob = new Blob([uint8Array], { type: 'image/jpeg' });
      // Create object URL from Blob
      const imgUrl = URL.createObjectURL(blob);

      // Perform isUserLiked check
      const isLiked = await isUserLiked(post.img_id);

      // Create post HTML element
      const postElement = document.createElement('div');
      postElement.className = 'post bg-white rounded-lg shadow-lg';
      postElement.innerHTML = `
        <div class="max-w-[300px]">
          <div class="post-header flex items-center p-4">
            <img src="${await handleProfile(post.profileCode)}" alt="User Avatar" class="rounded-full w-10 h-10 mr-2">
            <h2 class="text-lg font-medium">${post.username}</h2>
          </div>
          <div class="post-content">
            <img src="${imgUrl}" class="w-[600px] h-[300px] rounded-md" alt="Post Image" class="rounded-lg">
          </div>
          <div class="post-actions p-4 flex flex-row">
            <div class="like-button-container flex flex-row">
              <div class="heart cursor-pointer" data-post-id="${post.img_id}">${isLiked ? '❤️' : '♡'}</div>
              <p id="like-count-${post.img_id}" class="ml-2">${post.likes}</p>
            </div>
          </div>
        </div>`;

      // Append the post element to the posts container
      document.querySelector('.posts-container').appendChild(postElement);
    }

    // Bind like button click events
    bindLikeButtonEvents();

    document.getElementById('loadingSpinner').classList.add('hidden');

  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

async function isUserLiked(img_id) {
  const username = window.location.pathname.split('/')[2];

  try {
    const response = await fetch(`/api/imgs/${img_id}/is-liked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
    });
    const data = await response.json();
    return data.is_liked;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false; // Default to false if there's an error
  }
}

async function handleLikeClick(event) {
  const likeButton = event.target;
  const img_id = likeButton.getAttribute('data-post-id');
  const username = window.location.pathname.split('/')[2];

  likeButton.disabled = true;

  try {
    const isLiked = await isUserLiked(img_id);
    const user_id = await getIdFromUsername();

    console.log(user_id);

    if (isLiked) {
      // User has already liked the post, send unlike request
      await fetch(`/api/imgs/${img_id}/unlike`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, user_id }),
      });
    } else {
      // User has not liked the post, send like request
      await fetch(`/api/imgs/${img_id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, user_id }),
      });
    }

    // Update UI after like/unlike action
    const likesCountElement = document.getElementById(`like-count-${img_id}`);
    const currentLikesCount = parseInt(likesCountElement.innerText);
    const newLikesCount = isLiked ? currentLikesCount - 1 : currentLikesCount + 1;

    likesCountElement.innerText = newLikesCount;
    likeButton.innerHTML = isLiked ? '♡' : '❤️';
  } catch (error) {
    console.error('Error liking/unliking post:', error);
  } finally {
    // Re-enable the like button after the API request completes
    likeButton.disabled = false;
  }
}


function bindLikeButtonEvents() {
  const likeButtons = document.querySelectorAll('.heart');
  likeButtons.forEach(button => {
    button.addEventListener('click', handleLikeClick);
  });
}

document.addEventListener('DOMContentLoaded', loadPosts);

async function getIdFromUsername() {
  const username = window.location.pathname.split('/')[2];
  const res = await fetch(`/api/users/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await res.json();
  return data;
}
