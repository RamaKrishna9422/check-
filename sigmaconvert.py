import csv
import sys
import os
import pathlib
import itertools
from sigma.parser.collection import SigmaCollectionParser
from sigma.config.collection import SigmaConfigurationManager
from sigma.backends.splunk import SplunkBackend
from sigma.configuration import SigmaConfigurationChain
from sigma.parser.exceptions import SigmaCollectionParseError, SigmaParseError
from sigma.backends.exceptions import BackendError, NotSupportedError, PartialMatchError, FullMatchError

def sigma_convertor(argument):
    file_name = []
    lookup_file = argument.split("||")[1]
    file_name.append(argument.split("||")[0])
    f= open(lookup_file,"w+")
    header = "File name"+","+"Splunk Query"
    f.write(header)
    f.write('\n')
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
    
    sigmaconfigs = SigmaConfigurationChain()

    sigmaconfig = SigmaConfigurationManager().get('splunk-windows')
    #order = sigmaconfig.order
    sigmaconfigs.append(sigmaconfig)

    backend = SplunkBackend(sigmaconfigs, {'rulecomment': False})
    print("LENGTH",len(file_name))
    for sigmafile in get_inputs(file_name, False):
        try:
            print("* Processing Sigma input %s" % (sigmafile))
            if file_name == ['-']:
              f = sigmafile
            else:
              f = sigmafile.open(encoding='utf-8')
            parser = SigmaCollectionParser(f, sigmaconfigs, None)
            results = parser.generate(backend)
            for result in results:
              content = str(sigmafile)+","+str(result)
              #print(type(sigmafile)," ",type(result))
              with open(lookup_file,'a') as file:
                file.write(content)
                file.write('\n')
        except OSError as e:
            print("Failed to open Sigma file %s: %s" % (sigmafile, str(e)))
        except (SigmaParseError, SigmaCollectionParseError) as e:
            print("Sigma parse error in %s: %s" % (sigmafile, str(e)))
        except NotSupportedError as e:
            print("The Sigma rule requires a feature that is not supported by the target system: " + str(e))
        except BackendError as e:
            print("Backend error in %s: %s" % (sigmafile, str(e)))
        except (NotImplementedError, TypeError) as e:
            print("An unsupported feature is required for this Sigma rule (%s): " % (sigmafile) + str(e))
        except PartialMatchError as e:
            print("Partial field match error: %s" % str(e))
        except FullMatchError as e:
            print("Full field match error")
        except:
            print("error")
        finally:
            try:
                f.close()
            except:
                pass

    """path  = "/opt/splunk/etc/apps/search/gitrepo"
    #path = "gitrepo"
    clone = "git clone https://github.com/Neo23x0/sigma.git"

    #os.system("sshpass -p your_password ssh user_name@your_localhost")
    os.chdir(path) # Specifying the path where the cloned project needs to be copied
    os.system(clone) # Cloning


    rootdir = '/opt/splunk/etc/apps/search/gitrepo'
    extensions = ('.yml')
    file_list = []
    for subdir, dirs, files in os.walk(rootdir):
        for file in files:
            ext = os.path.splitext(file)[-1].lower()
            if ext in extensions and len(ext) !=0:
                file_list.append(os.path.join(subdir, file))

    #print(file_list)
    sigma_parser(file_list)"""

argument = sys.argv[1]
sigma_convertor(argument)

