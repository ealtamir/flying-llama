import web

from helpers import build_context

import jinja2
import os

# Template name, uri path, class name, filesystem path
urls = (
    ('index', '/index', 'index', 'index/index.html'),
    ('results', '/results', 'results', 'resultados.html'),
    ('summary', '/summary', 'summary', 'resumen.html'),
    ('confirmation', '/confirmation', 'confirmation', 'confirmacion.html'),
    ('info_input', '/info_input', 'info_input', 'ingresoinfo.html'),
    ('payment', '/payment', 'payment', 'ingresoinfopago.html'),
    ('index', '/.*', 'index', 'index/index.html'),
)


mappings, context, fs_paths = build_context(urls)

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'templates')
    ),
    extensions=['jinja2.ext.autoescape']
)

app = web.application(mappings, globals())


class index:
    def GET(self):
        try:
            template = JINJA_ENVIRONMENT.get_template(
                fs_paths[self.__class__.__name__]
            )
            template = template.render(context)
        except jinja2.TemplateNotFound as e:
            template = "can't find template: " + str(e)
        except Exception as e:
            template = "Exception raised: " + str(e)
        return template


class results:
    def GET(self):
        return 'results'


class summary:
    def GET(self):
        return 'summary'


class confirmation:
    def GET(self):
        return 'confirmation'


class info_input:
    def GET(self):
        return 'info_input'


class payment:
    def GET(self):
        return 'payment'

app = app.wsgifunc()
