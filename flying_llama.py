import web
import jinja2
import os

urls = (
    '/.*', 'index'
)

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'templates')
    ),
    extensions=['jinja2.ext.autoescape']
)

app = web.application(urls, globals())


class index:
    def GET(self):
        try:
            template = JINJA_ENVIRONMENT.get_template('index.html')
            template = template.render()
        except jinja2.TemplateNotFound:
            template = "Template not found :(."
        except Exception as e:
            template = e
        return template


app = app.wsgifunc()
