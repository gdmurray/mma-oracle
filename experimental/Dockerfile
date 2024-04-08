# Use the official Oracle Linux 8 image as a base
FROM oraclelinux:8.9

# Install SSH server and sudo
RUN yum -y install openssh-server sudo && \
    yum clean all && \
    rm -rf /var/cache/yum

# Set up SSH
RUN ssh-keygen -A
RUN echo 'root:Docker!' | chpasswd

# Create a user for SSH access
RUN useradd -m dockeruser && \
    echo 'dockeruser:Docker!' | chpasswd && \
    echo 'dockeruser ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers

# Expose the SSH port
EXPOSE 22

# Start the SSH daemon
CMD ["/usr/sbin/sshd", "-D"]
