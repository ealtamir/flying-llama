def build_context(urls):
    mappings = {}
    url = ()
    fs_paths = {}

    template_name = 0
    uri_path = 1
    class_name = 2
    fs_path = 3

    for r in urls:
        url += r[uri_path], r[class_name]
        mappings.update({r[template_name]: r[uri_path]})
        fs_paths.update({r[class_name]: r[fs_path]})

    return url, mappings, fs_paths,

if __name__ == "__main__":
    urls = (
        ('index', '/index', 'index', 'index/index.html'),
        ('results', '/results', 'results', 'resultados.html'),
        ('summary', '/summary', 'summary', 'resumen.html'),
        ('confirmation', '/confirmation', 'confirmation', 'confirmacion.html'),
        ('info_input', '/info_input', 'info_input', 'ingresoinfo.html'),
        ('payment', '/payment', 'payment', 'ingresoinfopago.html'),
        ('index', '/.*', 'index', 'index/index.html'),
    )
    a, b, c = build_context(urls)
    print "urls: " + str(a)
    print
    print "mappings: " + str(b)
    print
    print "fs_paths: " + str(c)
