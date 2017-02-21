FROM centos:7
MAINTAINER Las Cumbres Observatory <webmaster@lco.global>

EXPOSE 80
ENTRYPOINT [ "/init" ]

# Setup the Python Django environment
ENV PYTHONPATH /var/www/apps
ENV DJANGO_SETTINGS_MODULE messierbingo.settings

# Install package repositories
RUN yum -y install epel-release \
    && yum -y install MySQL-python gcc nginx python-devel python-pip \
            supervisor uwsgi-plugin-python \
    && yum -y update \
    && yum -y clean all

# Install python requirements
COPY app/requirements.txt /var/www/apps/messierbingo/requirements.txt
RUN pip install --upgrade 'pip>=9.0.1' \
        && pip install -r /var/www/apps/messierbingo/requirements.txt \
        && rm -rf ~/.cache/pip

# Copy operating system configuration files
COPY docker/ /

# Copy the LCOGT Messier Bingo files
COPY app /var/www/apps/messierbingo
