import web

from helpers import build_context, get_template

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
    ('default', '/.*', 'default', 'index/index.html'),
)


mappings, context, fs_paths = build_context(urls)

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(
        os.path.join(os.path.dirname(__file__), 'templates')
    ),
    extensions=['jinja2.ext.autoescape']
)

app = web.application(mappings, globals())


class default:
    def GET(self):
        return web.redirect('/index')


class index:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )


class results:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )


class summary:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )


class confirmation:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )


class info_input:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )


class payment:
    def GET(self):
        return get_template(
            JINJA_ENVIRONMENT, context, fs_paths[self.__class__.__name__]
        )

app = app.wsgifunc()
