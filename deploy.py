import subprocess
import sys


SUBTREE_COMMAND_TEMPLATE = 'git subtree split --prefix {folder_name} master'
PUSH_COMMAND_TEMPLATE = 'git push {remote} `{subtree_command}`:master --force'


def deploy_api():
    subprocess.run(
        PUSH_COMMAND_TEMPLATE.format(
            remote='heroku', subtree_command=SUBTREE_COMMAND_TEMPLATE.format(folder_name='mbti-server')
        ),
        shell=True,
    )


def deploy_web():
    print('web deploys are managed via netlify; push to master to trigger a build')


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print("""
    usage:
        python deploy.py (api|web)""")
        sys.exit(1)

    if sys.argv[1] == 'api':
        deploy_api()
    elif sys.argv[1] == 'web':
        deploy_web()
    else:
        print('error: unknown arg')
        sys.exit(1)
