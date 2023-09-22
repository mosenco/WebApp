#used to remove quickly files from folders
import os, shutil
folder = 'c:\\users\\tikyn\\Desktop\\WebApp\\visualization\\dati\\'
for filename in os.listdir(folder):
    file_path = os.path.join(folder, filename)
    if "sanremo" in filename:
        #print(filename)
        os.unlink(file_path)

folder = 'c:\\users\\tikyn\\Desktop\\WebApp\\encodingASP\\newAssignments\\input\\'
for filename in os.listdir(folder):
    file_path = os.path.join(folder, filename)
    if "Sanremo" in filename:
        print(filename)
        os.unlink(file_path)