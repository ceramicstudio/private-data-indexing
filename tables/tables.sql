-- LIST accountRelation
table capabilities {
  /*stream_id text -- The stream id of the post - auto-generated (do not define when creating table)*/
  /*controller text -- The DID controller of the post - auto-generated (do not define when creating table)*/ 
  delegatee DID -- DID of the delegatee
  stream text -- The stream the delegatee has access to
  capability text -- The capability for the delegatee
  topic text -- Additional metadata related to the content of the stream
}