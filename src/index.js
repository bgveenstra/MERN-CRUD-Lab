import React from 'react';
import ReactDOM from 'react-dom';
import CommentBox from './CommentBox';


// const apiUrl = 'https://mern-comment-box-api.herokuapp.com/comments';
const port = process.env.PORT || 4000;
const apiUrl = `http://localhost:${port}/api/comments`;

ReactDOM.render(
  <CommentBox
    url={apiUrl} pollInterval={2000} />,
  document.getElementById('root')
);
