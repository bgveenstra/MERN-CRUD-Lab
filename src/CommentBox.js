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
    this.handleCommentUpdate = this.handleCommentUpdate.bind(this);
    this.handleCommentDelete = this.handleCommentDelete.bind(this);
  }
  loadCommentsFromServer(){
    $.ajax({
      method: 'GET',
      url: this.props.url
    })
    .then(res => {
      console.log('response for comments from server', res);
      this.setState({ data: res  });
    })
  }
  handleCommentSubmit(comment) {
    console.log('handling comment submit with input', comment);
    let comments = this.state.data;
    // comment.id = Date.now();
    // let newComments = comments.concat([comment]);
    // this.setState({data: newComments});
    $.ajax({
      method: 'POST',
      url: this.props.url,
      data: comment
    })
    .then(res => {
      console.log('sucessful comment submit response', res);
      this.setState({ data: comments.push(res) })
    }, err => {
      console.error(err);
      this.setState({ data: comments });
    });
  }
  handleCommentDelete(id){
    $.ajax({
      method: 'DELETE',
      url: `${this.props.url}/${id}`
    })
    .then(res => {
      console.log('Comment Deleted');
    }, err => {
      console.log(err);
    });
  }
  handleCommentUpdate(id, comment){
    $.ajax({
      method: 'PUT',
      url:`${this.props.url}/${id}`,
      data: comment
    })
    .then(res => {
      console.log(res);
    }, err => {
      console.error(err);
    });
  }
  componentDidMount() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  }
  render() {
    return (
      <div style={ style.commentBox }>
        <h2 style={ style.title}>Comments:</h2>
      <CommentList
        onCommentDelete={ this.handleCommentDelete }
        onCommentUpdate={ this.handleCommentUpdate }
        data={ this.state.data } />
      <CommentForm onCommentSubmit={ this.handleCommentSubmit }/>
      </div>
    )
  }
}
export default CommentBox;
