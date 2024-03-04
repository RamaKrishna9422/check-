import sys
import pathlib
import itertools
from sigma.parser.collection import SigmaCollectionParser
from sigma.config.collection import SigmaConfigurationManager
from sigma.backends.splunk import SplunkBackend
from sigma.configuration import SigmaConfigurationChain

def alliter(path):
    for sub in path.iterdir():
        if sub.name.startswith("."):
            continue
        if sub.is_dir():
            yield from alliter(sub)
        else:
            yield sub

def get_inputs(paths, recursive):
    if paths == ['-']:
        return [sys.stdin]

    if recursive:
        return list(itertools.chain.from_iterable([list(alliter(pathlib.Path(p))) for p in paths]))
    else:
        return [pathlib.Path(p) for p in paths]
def sigma_parser(file_name):
    sigmaconfigs = SigmaConfigurationChain()

    sigmaconfig = SigmaConfigurationManager().get('splunk-windows')
    #order = sigmaconfig.order
    sigmaconfigs.append(sigmaconfig)

    backend = SplunkBackend(sigmaconfigs, {'rulecomment': False})
    
    for sigmafile in get_inputs(file_name, False):
        print("* Processing Sigma input %s" % (sigmafile))
        if file_name == ['-']:
          f = sigmafile
        else:
          f = sigmafile.open(encoding='utf-8')
        parser = SigmaCollectionParser(f, sigmaconfigs, None)
        results = parser.generate(backend)
        for result in results:
          print("Filename: ",file_name)
          print("Splunk Query: ",result)
