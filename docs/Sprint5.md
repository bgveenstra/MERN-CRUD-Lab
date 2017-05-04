### Sprint 5: AJAX


Now we are going to use `jquery-ajax`, a node package that has *just* the AJAX methods from `jquery`.

Here's what our CommentBox.js will look like with the AJAX call to get comments:

```js
//CommentBox.js
import React, { Component } from 'react';
import $ from 'jquery-ajax';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import style from './style';

class CommentBox extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
    this.loadCommentsFromServer = this.loadCommentsFromServer.bind(this);
    this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
  }
  loadCommentsFromServer() {
    $.ajax({
      method: 'GET',
      url: this.props.url
    })
    .then((res) => {
      this.setState({ data: res });
    }, (err) => {
      console.log('error', err)
    })
  }
  handleCommentSubmit(comment) {
    //add POST request

  }
  componentDidMount() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  }
  render() {
    return (
      <div style={ style.commentBox }>
        <h2>Comments:</h2>
      <CommentList data={ this.state.data }/>
      <CommentForm onCommentSubmit={ this.handleCommentSubmit }/>
      </div>
    )
  }
}

export default CommentBox;
```

Now when you look at your React app on localhost, the new Postman data should appear.

![yay](https://38.media.tumblr.com/d3ffb6750636f4476afe3b5c6a7f3461/tumblr_inline_n60311def41sg992s.gif)

Now, let's change our CommentList.js to use the MongoDB `_id` property:

```js
//CommentList.js
import React, { Component } from 'react';
import Comment from './Comment';
import style from './style';

class CommentList extends Component {
  render() {
    let commentNodes = this.props.data.map(comment => {
      return (
        <Comment author={ comment.author } key={ comment['_id'] }>
          { comment.text}
        </Comment>
      )
    })
    return (
      <div style={ style.commentList }>
        { commentNodes }
      </div>
    )
  }
}

export default CommentList;
```

Try posting some more data with Postman. Because we set up a polling interval, you should see the data appear momentarily on your served React app.

Next we need to whip up a form for POSTing:

```js
//CommentForm.js
//...
handleSubmit(e) {
  e.preventDefault();
  let author = this.state.author.trim();
  let text = this.state.text.trim();
  if (!text || !author) {
    return;
  }
  this.props.onCommentSubmit({ author: author, text: text });
  this.setState({ author: '', text: '' });
}
//...
```

...and add in our post method:

```js
//CommentBox.js
//....
handleCommentSubmit(comment) {
  $.ajax({
    method: 'POST',
    url: this.props.url,
    data: comment
  })
  .then((res) => {
    this.setState({ data: res });
  }, (err) => {
    console.error('post error', err);
  });
}
```

This is pretty good already - now just a bit of cleanup to our CommentBox.js:

```js
//CommentBox.js
//...
handleCommentSubmit(comment) {
  let comments = this.state.data;
  comment.id = Date.now();
  let newComments = comments.concat([comment]);
  this.setState({ data: newComments });
  $.ajax({
    method: 'POST',
    url: this.props.url,
    data: comment
  })
  .catch(err => {
    console.error(err);
    this.setState({ data: comments });
  });
}
//...
```
