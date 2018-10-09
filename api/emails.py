# coding: utf-8
'''Email templating and dispatch.'''
from smtplib import SMTP
from email.mime import multipart, text
from jinja2 import Environment, FileSystemLoader

from .config import config
from .log import logger

#	Create a logger.
log = logger(__name__) # pylint: disable=invalid-name

#	Create the Jinja environment.
jinja_environ = Environment( #	pylint: disable=invalid-name
	loader=FileSystemLoader('./email-templates')
)

# pylint: disable=invalid-name, bad-continuation
def send_email(sender=None, to=None, subject=None, template=None,
		context=None):
	'''Send an email.
	:param sender: The fully qualified sender.
	:param to: A destination address or iterable thereof.
	:param subject: The subject of the email.
	:param template: The email template name.
	:param context: The template render context.'''
	#	Maybe setup default sender.
	if not sender:
		sender = 'noreply@%s'%config.env.site_domain
	#	Stringify destination addresses.
	if isinstance(to, (list, tuple)):
		to = ','.join(to)
	log.info('Sending email "%s" from %s to %s', subject, sender, to)

	#	Create the message.
	message = multipart.MIMEMultipart()
	message['From'] = sender
	message['To'] = to
	message['Subject'] = subject
	#	Attach the body.
	context['subject'] = subject
	message.attach(text.MIMEText(
		jinja_environ.get_template(template).render(**context), 'html'
	))

	#	Send.
	smtp_handler = SMTP(config.email.smtp_dest_address)
	smtp_handler.sendmail(sender, to, message.as_string())
	smtp_handler.quit()
