# ToDo

[ ] Make Nginx Proxy Work with Let's Encrypt
[ ] Docker Dynamic Inventory Not Working
[ ] Folder Refactor resulting in docker-compose Changes. Fix It 

# Encrypt/Decrypt Certificates

ansible-vault encrypt application/web-proxy/nginx-proxy/rootfs/etc/nginx/certs/tracker.learn.cisco-selfsign.* --vault-password-file ./.vault_pass
ansible-vault decrypt application/web-proxy/nginx-proxy/rootfs/etc/nginx/certs/tracker.learn.cisco-selfsign.* --vault-password-file ./.vault_pass

