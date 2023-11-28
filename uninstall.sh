#!/bin/sh

# Define the user's home directory and username
USER_HOME="$HOME"

# Stop any running instance of the application
# pkill -f 'npm start' # This will kill all processes that have 'npm start' in their command

# Remove autostart entry
sudo rm -f /etc/xdg/autostart/orca.desktop

# Remove desktop shortcuts
rm -f $USER_HOME/Desktop/orca.desktop
rm -f $USER_HOME/Desktop/orcaUpdater.desktop

# Remove the cloned repository and its contents
rm -rf $USER_HOME/Documents/Orca-modular

# Remove npm if it was not previously installed
# Caution: This might remove dependencies for other applications
# sudo apt-get remove --purge -y npm
# sudo apt-get autoremove -y

# Reset wallpaper to default or remove the setting (commented out, optional)
pcmanfm --wallpaper-mode=center
pcmanfm --set-wallpaper="/usr/share/raspberrypi-artwork/raspberry-pi-logo.png"

  
echo "Orca Uninstallation completed."
