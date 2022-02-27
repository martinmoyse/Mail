document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('', '', ''));

  // By default, load the inbox
  load_mailbox('inbox');

  // Handles form submission
  document.querySelector('#compose-form').addEventListener('submit', send_email);

});

function compose_email(recipient, subject, body) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#show-email').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}

function archive_email(id) {
  fetch('/emails/' + id, {
    method: "PUT",
    body: JSON.stringify({
      archived: true
    })
  });
  
  (function()
{
  if( window.localStorage )
  {
    if( !localStorage.getItem('firstLoad') )
    {
      localStorage['firstLoad'] = true;
      window.location.reload();
    }  
    else
      localStorage.removeItem('firstLoad');
  }
})();
load_mailbox('inbox');
(function()
{
  if( window.localStorage )
  {
    if( !localStorage.getItem('firstLoad') )
    {
      localStorage['firstLoad'] = true;
      window.location.reload();
    }  
    else
      localStorage.removeItem('firstLoad');
  }
})();
}

function unarchive_email(id) {
  fetch('/emails/' + id, {
    method: "PUT",
    body: JSON.stringify({
      archived: false
    })
  });
  (function()
{
  if( window.localStorage )
  {
    if( !localStorage.getItem('firstLoad') )
    {
      localStorage['firstLoad'] = true;
      window.location.reload();
    }  
    else
      localStorage.removeItem('firstLoad');
  }
})();
  load_mailbox('inbox');
  (function()
{
  if( window.localStorage )
  {
    if( !localStorage.getItem('firstLoad') )
    {
      localStorage['firstLoad'] = true;
      window.location.reload();
    }  
    else
      localStorage.removeItem('firstLoad');
  }
})();
}

function reply(id){
  
  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
    let recipient = email['sender'];
    let subject = email['subject'];
    let timestamp = email['timestamp'];
    let body = `On ${timestamp} you wrote: ` + '\n' + email['body'];
    if(subject.startsWith('Re: ') == false){
      subject = 'Re: ' + subject;
      compose_email(recipient, subject);
    }
    compose_email(recipient, subject, body);
  })
}

function load_email(id, mailbox) {
  // Hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'block';

  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {

    if (mailbox == 'sent'){
      emailDiv = document.querySelector('#show-email');
      emailDiv.innerHTML = "<div><b>Sender: </b>" + email['sender'] + "</div>" + 
                        "<div><b>Recipients: </b>" + email['recipients'] + "</div>" +
                        "<div><b>Subject: </b>" + email['subject'] + "</div>" 
                        + "<br>" + 
                        "<div>" + email['body'] + "</div>" +
                        "<div><i>" + email['timestamp'] + "</i></div>" + 
                        "<button class='btn btn-sm btn-outline-primary' onclick='reply(" + id + ")'>Reply</button></div>";
    }

    else if (email['archived'] == false){
      emailDiv = document.querySelector('#show-email');
      emailDiv.innerHTML = "<div><b>Sender: </b>" + email['sender'] + "</div>" + 
                        "<div><b>Recipients: </b>" + email['recipients'] + "</div>" +
                        "<div><b>Subject: </b>" + email['subject'] + "</div>" 
                        + "<br>" + 
                        "<div>" + email['body'] + "</div>" +
                        "<div><i>" + email['timestamp'] + "</i></div>" + 
                        "<div class='buttons'><button onclick='archive_email(" + id + ")' class='btn btn-sm btn-outline-primary'>Archive</button>" +
                        "<button class='btn btn-sm btn-outline-primary' onclick='reply(" + id + ")'>Reply</button></div>";
    }
    else if (email['archived'] == true){
      emailDiv = document.querySelector('#show-email');
      emailDiv.innerHTML = "<div><b>Sender: </b>" + email['sender'] + "</div>" + 
                        "<div><b>Recipients: </b>" + email['recipients'] + "</div>" +
                        "<div><b>Subject: </b>" + email['subject'] + "</div>" 
                        + "<br>" + 
                        "<div>" + email['body'] + "</div>" +
                        "<div><i>" + email['timestamp'] + "</i></div>" + 
                        "<div class='buttons'><button onclick='unarchive_email(" + id + ")' class='btn btn-sm btn-outline-primary'>Unarchive</button>" + 
                        "<button class='btn btn-sm btn-outline-primary' onclick='reply(" + id + ")'>Reply</button></div>";
    }
           
      
  });
  

  if(mailbox == "inbox"){
    fetch('/emails/' + id, {
      method: "PUT",
      body: JSON.stringify({
        read: false,
      })
    });
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#show-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    const mailboxContainer = document.querySelector('#emails-view');
  
    fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(emails => {

        // Display emails in Inbox
          emails.forEach(email => {
            const newDiv = document.createElement("div");
            newDiv.classList.add('mailbox-email');
            mailboxContainer.appendChild(newDiv);

            if(mailbox == 'sent' || email['read'] == false) {
              newDiv.innerHTML = "<div class='sender-read'>"+ email['sender'] +"</div>" + 
              "<div class='subject-read'>" + email['subject'] + "</div>" + 
              "<div class='timestamp'>" + email['timestamp'] + "</div>";
            }
            
            else if (email['read'] == true) {
              newDiv.classList.add('mailbox-email-unread')
              newDiv.innerHTML = "<div class='sender-unread'>"+ email['sender'] +"</div>" + 
              "<div class='subject-unread'>" + email['subject'] + "</div>" + 
              "<div class='timestamp'>" + email['timestamp'] + "</div>";
            }
           
            // Open email on click
            newDiv.addEventListener('click', () => load_email(email['id'], mailbox));
          });
    });
  }
  


function send_email(event) {
  event.preventDefault();
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox("sent", result);
  });  
}
